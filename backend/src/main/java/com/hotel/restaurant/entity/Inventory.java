package com.hotel.restaurant.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Integer inventoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private FoodItem foodItem;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "minimum_threshold", nullable = false)
    private Integer minimumThreshold = 5;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;
}
