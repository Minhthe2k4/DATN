package com.example.DATN;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DatnApplication {

	public static void main(String[] args) {
		System.out.println("DEBUG: Starting application on port: " + System.getenv("PORT"));
		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			System.out.println("DEBUG: SHUTDOWN HOOK TRIGGERED!");
		}));
		try {
			SpringApplication.run(DatnApplication.class, args);
			System.out.println("DEBUG: APPLICATION STARTED SUCCESSFULLY!");
		} catch (Throwable t) {
			if (t.getClass().getName().contains("SilentExitException")) {
				throw t;
			}
			System.err.println("FATAL ERROR DURING STARTUP:");
			t.printStackTrace();
			System.exit(1);
		}
	}

}
