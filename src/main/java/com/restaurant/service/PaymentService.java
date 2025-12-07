package com.restaurant.service;

import com.restaurant.model.Payment;
import com.restaurant.model.enums.PaymentMethod;
import com.restaurant.repository.PaymentRepository;
import com.restaurant.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    public Optional<Payment> getPaymentById(String id) {
        return paymentRepository.findById(id);
    }
    
    public Payment createPayment(Payment payment) {
        if (payment.getCreatedAt() == null) {
            payment.setCreatedAt(LocalDateTime.now());
        }
        
        // Verify order exists
        orderRepository.findById(payment.getOrder().getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        return paymentRepository.save(payment);
    }
    
    public Payment updatePayment(String id, Payment payment) {
        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        
        existingPayment.setOrder(payment.getOrder());
        existingPayment.setAmount(payment.getAmount());
        existingPayment.setMethod(payment.getMethod());
        
        return paymentRepository.save(existingPayment);
    }
    
    public void deletePayment(String id) {
        paymentRepository.deleteById(id);
    }
    
    public List<Payment> getPaymentsByOrder(String orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
    
    public List<Payment> getPaymentsByMethod(PaymentMethod method) {
        return paymentRepository.findByMethod(method);
    }
    
    public List<Payment> getPaymentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByCreatedAtBetween(start, end);
    }
    
    // Tính doanh thu
    public Double calculateRevenue(LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByCreatedAtBetween(start, end)
                .stream()
                .mapToDouble(p -> p.getAmount().doubleValue())
                .sum();
    }
}














