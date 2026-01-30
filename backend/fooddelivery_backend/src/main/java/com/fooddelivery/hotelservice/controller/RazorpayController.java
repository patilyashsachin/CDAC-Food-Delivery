package com.fooddelivery.hotelservice.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/razorpay")
@CrossOrigin(origins = "http://localhost:5173")
public class RazorpayController {

    private final String KEY_ID = "rzp_test_your_key_id"; // USER SHOULD REPLACE
    private final String KEY_SECRET = "your_key_secret"; // USER SHOULD REPLACE

    @PostMapping("/create-order")
    public ResponseEntity<String> createOrder(@RequestBody Map<String, Object> data) {
        try {
            RazorpayClient razorpay = new RazorpayClient(KEY_ID, KEY_SECRET);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) data.get("amount") * 100); // Amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_123456");

            Order order = razorpay.orders.create(orderRequest);
            return ResponseEntity.ok(order.toString());
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
