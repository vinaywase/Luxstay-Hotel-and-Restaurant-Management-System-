package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.RestaurantOrderDto;
import com.hotel.restaurant.service.RestaurantOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class RestaurantOrderController {

    private final RestaurantOrderService orderService;

    public RestaurantOrderController(RestaurantOrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantOrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantOrderDto> getOrderById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    public ResponseEntity<RestaurantOrderDto> placeOrder(@Validated @RequestBody RestaurantOrderDto dto) {
        return new ResponseEntity<>(orderService.createOrder(dto), HttpStatus.CREATED);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RestaurantOrderDto>> getOrdersByCustomerId(@PathVariable("customerId") Integer customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(customerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantOrderDto> updateOrder(@PathVariable("id") Integer id,
            @Validated @RequestBody RestaurantOrderDto dto) {
        return ResponseEntity.ok(orderService.updateOrder(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RestaurantOrderDto> updateOrderStatus(@PathVariable("id") Integer id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable("id") Integer id) {
        System.out.println("Delete Id ------------------> " + id);
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
