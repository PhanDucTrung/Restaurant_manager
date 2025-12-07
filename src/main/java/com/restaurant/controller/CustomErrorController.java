package com.restaurant.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {
    
    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        
        Map<String, Object> errorResponse = new HashMap<>();
        
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            errorResponse.put("status", statusCode);
            errorResponse.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
            
            if (statusCode == 404) {
                errorResponse.put("message", "Endpoint không tồn tại. Vui lòng kiểm tra lại đường dẫn API.");
                errorResponse.put("availableEndpoints", Map.of(
                    "root", "/",
                    "docs (Swagger UI)", "/docs",
                    "tables", "/api/tables",
                    "categories", "/api/categories",
                    "menu-items", "/api/menu-items",
                    "customers", "/api/customers",
                    "orders", "/api/orders",
                    "payments", "/api/payments",
                    "employees", "/api/employees",
                    "inventory", "/api/inventory"
                ));
            } else {
                errorResponse.put("message", message != null ? message.toString() : "Đã xảy ra lỗi");
            }
        } else {
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "Đã xảy ra lỗi không xác định");
        }
        
        if (path != null) {
            errorResponse.put("path", path.toString());
        }
        
        HttpStatus httpStatus = status != null ? 
            HttpStatus.valueOf(Integer.parseInt(status.toString())) : 
            HttpStatus.INTERNAL_SERVER_ERROR;
        
        return ResponseEntity.status(httpStatus).body(errorResponse);
    }
}

