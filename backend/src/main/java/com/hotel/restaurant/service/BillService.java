package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.BillDto;
import java.util.List;
import java.util.Map;

public interface BillService {
    List<BillDto> getAllBills();
    BillDto getBillById(Integer id);
    BillDto createBill(BillDto dto);
    BillDto updateBill(Integer id, BillDto dto);
    void deleteBill(Integer id);
    BillDto generateCompleteBill(Integer customerId);
    BillDto generateBillForService(Integer customerId, String serviceType, Integer referenceId, java.math.BigDecimal amount);
    List<BillDto> getBillsByCustomerId(Integer customerId);

    // ✅ NEW: Receipt method declare in service interface — only this will added  to service, rest of the code is same as before
    Map<String, Object> getBillReceipt(Integer billId);
}