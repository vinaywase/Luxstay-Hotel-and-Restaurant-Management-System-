package com.hotel.restaurant.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@RestController
public class TestController {

    private final JdbcTemplate jdbcTemplate;

    public TestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/test/fks")
    public List<Map<String, Object>> getFks() {
        String sql = "SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
                     "FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                     "WHERE REFERENCED_TABLE_NAME = 'restaurant_orders'";
        return jdbcTemplate.queryForList(sql);
    }
}
