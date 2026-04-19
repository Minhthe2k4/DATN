package com.example.DATN.service;

import com.example.DATN.entity.LookupHistory;
import com.example.DATN.repository.LookupHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LookupHistoryService {
    @Autowired
    private LookupHistoryRepository lookupHistoryRepository;

    public LookupHistory save(LookupHistory history) {
        return lookupHistoryRepository.save(history);
    }
}
