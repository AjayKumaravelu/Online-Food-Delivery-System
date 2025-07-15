package com.fooddelivery.orderservicef.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long menuItemId;
    private String itemName;
    private Integer quantity;
    private double price;
}