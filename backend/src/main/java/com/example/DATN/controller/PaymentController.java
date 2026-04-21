package com.example.DATN.controller;

import com.example.DATN.config.ZaloPayUtils;
import com.example.DATN.dto.PaymentResponse;
import com.example.DATN.entity.PremiumPlan;
import com.example.DATN.entity.Transaction;
import com.example.DATN.entity.User;
import com.example.DATN.repository.PremiumPlanRepository;
import com.example.DATN.repository.TransactionRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.service.PremiumService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${zalopay.app-id}")
    private String appId;

    @Value("${zalopay.key1}")
    private String key1;

    @Value("${zalopay.key2}")
    private String key2;

    @Value("${zalopay.endpoint}")
    private String endpoint;

    @Value("${zalopay.redirect-url}")
    private String redirectUrl;

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PremiumPlanRepository premiumPlanRepository;
    private final PremiumService premiumService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentController(TransactionRepository transactionRepository,
                             UserRepository userRepository,
                             PremiumPlanRepository premiumPlanRepository,
                             PremiumService premiumService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.premiumPlanRepository = premiumPlanRepository;
        this.premiumService = premiumService;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<PremiumPlan>> getAllPlans() {
        return ResponseEntity.ok(premiumPlanRepository.findAll());
    }

    @GetMapping("/create-order")
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestParam("userId") Long userId,
            @RequestParam("planId") Long planId) {

        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            PremiumPlan plan = premiumPlanRepository.findById(planId).orElseThrow(() -> new RuntimeException("Plan not found"));

            Random rand = new Random();
            int res = rand.nextInt(1000000);
            long amount = plan.price.longValue();
            long app_time = System.currentTimeMillis();
            String app_user = user.username;
            
            // Chuỗi dữ liệu để tạo MAC
            // app_trans_id định dạng: yyMMdd_random
            String app_trans_id = new SimpleDateFormat("yyMMdd").format(new Date()) + "_" + res;

            // ZaloPay redirect_url cần truyền qua embed_data
            Map<String, String> embedDataMap = new HashMap<>();
            embedDataMap.put("redirecturl", redirectUrl);
            String embed_data_str = objectMapper.writeValueAsString(embedDataMap);
            
            String item_str = "[]"; 

            String data = appId + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data_str + "|" + item_str;
            String mac = ZaloPayUtils.hmacSHA256(key1, data);

            // Dùng Map để ObjectMapper tự động tạo JSON chuẩn
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("app_id", Integer.parseInt(appId));
            body.put("app_user", app_user);
            body.put("app_trans_id", app_trans_id);
            body.put("app_time", app_time);
            body.put("amount", amount);
            body.put("item", item_str);
            body.put("description", "Thanh toan Premium " + plan.name);
            body.put("embed_data", embed_data_str);
            body.put("mac", mac);

            String jsonBody = objectMapper.writeValueAsString(body);

            System.out.println("--- DEBUG ZALOPAY 2553 ---");
            System.out.println("Data string: " + data);
            System.out.println("JSON Body: " + jsonBody);

            // Lưu transaction
            Transaction transaction = new Transaction();
            transaction.user = user;
            transaction.plan = plan;
            transaction.amount = plan.price;
            transaction.paymentMethod = "ZALOPAY";
            transaction.status = "PENDING";
            transaction.paymentTransId = app_trans_id;
            transactionRepository.save(transaction);

            // Gửi yêu cầu
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("ZaloPay Raw Response: " + response.body());
            Map<String, Object> result = objectMapper.readValue(response.body(), Map.class);

            if (result.get("return_code").toString().equals("1")) {
                return ResponseEntity.ok(PaymentResponse.builder()
                        .status("Ok")
                        .message("Successfully")
                        .url(result.get("order_url").toString())
                        .build());
            } else {
                return ResponseEntity.status(500).body(PaymentResponse.builder()
                        .status("Error")
                        .message(result.get("return_message").toString())
                        .build());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(PaymentResponse.builder()
                    .status("Error")
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestParam Map<String, String> params) {
        // ZaloPay trả về apptransid trong params redirect
        String apptransid = params.get("apptransid");
        String statusStr = params.get("status");
        
        if (statusStr == null) {
            return ResponseEntity.status(400).body(Map.of("status", "ERROR", "message", "Missing status parameter"));
        }
        
        int status = Integer.parseInt(statusStr);

        if (status == 1) { // 1 là thành công tại ZaloPay
            Transaction transaction = transactionRepository.findByPaymentTransId(apptransid)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));
            
            // Cập nhật trạng thái chờ duyệt thay vì tự động kích hoạt
            if ("PENDING".equals(transaction.status)) {
                transaction.status = "AWAITING"; // Đã thanh toán, chờ duyệt
                transactionRepository.save(transaction);
                // Không gọi premiumService.upgradeUserAfterPayment ở đây nữa
            }
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Thanh toán thành công! Vui lòng chờ quản trị viên duyệt."));
        }
        return ResponseEntity.ok(Map.of("status", "FAILED", "message", "Giao dịch không thành công hoặc đã bị hủy."));
    }
}
