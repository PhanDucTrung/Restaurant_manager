package com.restaurant.controller;

import com.restaurant.model.Table;
import com.restaurant.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "*")
@Tag(name = "Tables", description = "API quản lý bàn ăn")
public class TableController {
    
    @Autowired
    private TableService tableService;
    
    @Operation(summary = "Lấy danh sách tất cả bàn", description = "Trả về danh sách tất cả các bàn trong hệ thống")
    @ApiResponse(responseCode = "200", description = "Thành công")
    @GetMapping
    public ResponseEntity<List<Table>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }
    
    @Operation(summary = "Lấy thông tin bàn theo ID", description = "Trả về thông tin chi tiết của một bàn cụ thể")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Thành công"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bàn")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Table> getTableById(
            @Parameter(description = "ID của bàn", required = true) @PathVariable String id) {
        return tableService.getTableById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @Operation(summary = "Tạo bàn mới", description = "Tạo một bàn mới trong hệ thống")
    @ApiResponse(responseCode = "201", description = "Tạo thành công")
    @PostMapping
    public ResponseEntity<Table> createTable(@RequestBody Table table) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tableService.createTable(table));
    }
    
    @Operation(summary = "Cập nhật thông tin bàn", description = "Cập nhật thông tin của một bàn đã tồn tại")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bàn")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Table> updateTable(
            @Parameter(description = "ID của bàn", required = true) @PathVariable String id, 
            @RequestBody Table table) {
        try {
            return ResponseEntity.ok(tableService.updateTable(id, table));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @Operation(summary = "Xóa bàn", description = "Xóa một bàn khỏi hệ thống")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Xóa thành công"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bàn")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(
            @Parameter(description = "ID của bàn", required = true) @PathVariable String id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Lấy bàn theo trạng thái", description = "Lấy danh sách bàn theo trạng thái (Trống, Đặt trước, Đang sử dụng, Sửa chữa)")
    @ApiResponse(responseCode = "200", description = "Thành công")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Table>> getTablesByStatus(
            @Parameter(description = "Trạng thái bàn", required = true) @PathVariable String status) {
        return ResponseEntity.ok(tableService.getTablesByStatus(status));
    }
    
    @Operation(summary = "Lấy bàn theo khu vực", description = "Lấy danh sách bàn theo khu vực")
    @ApiResponse(responseCode = "200", description = "Thành công")
    @GetMapping("/area/{area}")
    public ResponseEntity<List<Table>> getTablesByArea(
            @Parameter(description = "Khu vực", required = true) @PathVariable String area) {
        return ResponseEntity.ok(tableService.getTablesByArea(area));
    }
}


