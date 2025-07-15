//
//
//package com.example.payment.controller;
//
//import com.example.payment.dto.PaymentRequestDTO;
//import com.example.payment.dto.PaymentResponseDTO;
//import com.example.payment.exception.DuplicateTransactionException;
//import com.example.payment.exception.ResourceNotFoundException;
//import com.example.payment.service.PaymentService;
//import jakarta.validation.Valid;
//import lombok.extern.slf4j.Slf4j; // Provides the 'log' object
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
///**
// * REST Controller for managing payment operations (initiation, confirmation, retrieval, deletion).
// */
//@RestController
//@RequestMapping("/api/payments")
//@Slf4j // Enables logging for this class
//public class PaymentController {
//
//    private final PaymentService paymentService;
//
//    /**
//     * Constructs the PaymentController, injecting PaymentService.
//     */
//    public PaymentController(PaymentService paymentService) {
//        this.paymentService = paymentService;
//        log.info("PaymentController initialized."); // Logs controller startup
//    }
//
//    /**
//     * **POST /api/payments/initiate**
//     * Initiates a new payment transaction.
//     * @param requestDTO Payment initiation details.
//     * @return PaymentResponseDTO with transaction status.
//     */
//    @PostMapping("/initiate")
//    public ResponseEntity<PaymentResponseDTO> initiatePayment(@Valid @RequestBody PaymentRequestDTO requestDTO) {
//        log.info("Initiating payment for order ID: {}", requestDTO.getOrderId()); // Log request start
//        try {
//            PaymentResponseDTO responseDTO = paymentService.initiatePayment(requestDTO);
//            log.info("Payment initiated, transaction ID: {}", responseDTO.getTransactionId()); // Log success
//            return ResponseEntity.ok(responseDTO);
//        } catch (Exception e) {
//            log.error("Failed to initiate payment for order ID {}: {}", requestDTO.getOrderId(), e.getMessage(), e); // Log errors with stack trace
//            throw e;
//        }
//    }
//
//    /**
//     * **POST /api/payments/confirm**
//     * Confirms a previously initiated payment.
//     * @param requestDTO Payment confirmation details.
//     * @return Success message.
//     * @throws DuplicateTransactionException if already confirmed.
//     * @throws ResourceNotFoundException if payment not found.
//     */
//    @PostMapping("/confirm")
//    public ResponseEntity<String> confirmPayment(@Valid @RequestBody PaymentRequestDTO requestDTO)
//            throws DuplicateTransactionException, ResourceNotFoundException {
//        log.info("Confirming payment for order ID: {}", requestDTO.getOrderId()); // Log request start
//        try {
//            paymentService.confirmPayment(requestDTO);
//            log.info("Payment confirmed for order ID: {}", requestDTO.getOrderId()); // Log success
//            return ResponseEntity.ok("Payment confirmed successfully.");
//        } catch (DuplicateTransactionException e) {
//            log.warn("Duplicate confirmation for order ID {}: {}", requestDTO.getOrderId(), e.getMessage()); // Log warnings
//            throw e;
//        } catch (ResourceNotFoundException e) {
//            log.warn("Payment not found for confirmation, order ID {}: {}", requestDTO.getOrderId(), e.getMessage()); // Log warnings
//            throw e;
//        } catch (Exception e) {
//            log.error("Error confirming payment for order ID {}: {}", requestDTO.getOrderId(), e.getMessage(), e); // Log errors
//            throw e;
//        }
//    }
//
//    /**
//     * **GET /api/payments/order/{orderId}**
//     * Retrieves payment details by order ID.
//     * @param orderId The ID of the order.
//     * @return PaymentResponseDTO with details.
//     * @throws ResourceNotFoundException if payment not found.
//     */
//    @GetMapping("/order/{orderId}")
//    public ResponseEntity<PaymentResponseDTO> getPaymentDetails(@PathVariable Long orderId)
//            throws ResourceNotFoundException {
//        log.info("Fetching payment details for order ID: {}", orderId); // Log request start
//        try {
//            PaymentResponseDTO responseDTO = paymentService.getPaymentDetails(orderId);
//            log.info("Payment details found for order ID: {}", orderId); // Log success
//            return ResponseEntity.ok(responseDTO);
//        } catch (ResourceNotFoundException e) {
//            log.warn("Payment details not found for order ID {}: {}", orderId, e.getMessage()); // Log warnings
//            throw e;
//        } catch (Exception e) {
//            log.error("Error fetching payment details for order ID {}: {}", orderId, e.getMessage(), e); // Log errors
//            throw e;
//        }
//    }
//
//    /**
//     * **DELETE /api/payments/order/{orderId}**
//     * Deletes a payment record by order ID.
//     * @param orderId The ID of the order.
//     * @return Success message.
//     */
//    @DeleteMapping("/order/{orderId}")
//    public ResponseEntity<String> deletePayment(@PathVariable Long orderId) {
//        log.info("Deleting payment for order ID: {}", orderId); // Log request start
//        try {
//            paymentService.deletePaymentByOrderId(orderId);
//            log.info("Payment record deleted for order ID: {}", orderId); // Log success
//            return ResponseEntity.ok("OrderId :" + orderId + " deleted successfully.");
//        } catch (ResourceNotFoundException e) {
//            log.warn("Attempted to delete non-existent payment for order ID {}: {}", orderId, e.getMessage()); // Log warnings
//            throw e;
//        } catch (Exception e) {
//            log.error("Error deleting payment for order ID {}: {}", orderId, e.getMessage(), e); // Log errors
//            throw e;
//        }
//    }
//}

package com.example.payment.controller;

import com.example.payment.dto.PaymentRequestDTO;
import com.example.payment.dto.PaymentResponseDTO;
import com.example.payment.dto.PaymentConfirmDTO;
import com.example.payment.exception.DuplicateTransactionException;
import com.example.payment.exception.ResourceNotFoundException;
import com.example.payment.exception.InvalidInputFormatException;
import com.example.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
        log.info("PaymentController initialized.");
    }


    
    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(@Valid @RequestBody PaymentRequestDTO requestDTO) {
    	
        log.info("Initiating payment for order ID: {}", requestDTO.getOrderId());
        try {
            PaymentResponseDTO responseDTO = paymentService.initiatePayment(requestDTO);
            log.info("Payment initiated, transaction ID: {}", responseDTO.getTransactionId());
            return ResponseEntity.ok(responseDTO);
        } catch (InvalidInputFormatException e) {
            log.error("Invalid input format for order ID {}: {}", requestDTO.getOrderId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            log.error("Failed to initiate payment for order ID {}: {}", requestDTO.getOrderId(), e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/confirm")
    public ResponseEntity<String> confirmPayment(@Valid @RequestBody PaymentRequestDTO requestDTO,@RequestHeader("X-Internal-User-Roles")String roles)
            throws DuplicateTransactionException, ResourceNotFoundException, InvalidInputFormatException {
    	
    	if (!roles.contains("CUSTOMER")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        log.info("Confirming payment for order ID: {}", requestDTO.getOrderId());
        try {
            paymentService.confirmPayment(requestDTO);
            log.info("Payment confirmed for order ID: {}", requestDTO.getOrderId());
            return ResponseEntity.ok("Payment confirmed successfully.");
        } catch (DuplicateTransactionException e) {
            log.warn("Duplicate confirmation for order ID {}: {}", requestDTO.getOrderId(), e.getMessage());
            throw e;
        } catch (ResourceNotFoundException e) {
            log.warn("Payment not found for confirmation, order ID {}: {}", requestDTO.getOrderId(), e.getMessage());
            throw e;
        } catch (InvalidInputFormatException e) {
            log.error("Invalid input format for order ID {}: {}", requestDTO.getOrderId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input format.");
        } catch (Exception e) {
            log.error("Error confirming payment for order ID {}: {}", requestDTO.getOrderId(), e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentDetails(@PathVariable Long orderId)
            throws ResourceNotFoundException {
    	
    	
        log.info("Fetching payment details for order ID: {}", orderId);
        try {
            PaymentResponseDTO responseDTO = paymentService.getPaymentDetails(orderId);
            log.info("Payment details found for order ID: {}", orderId);
            return ResponseEntity.ok(responseDTO);
        } catch (ResourceNotFoundException e) {
            log.warn("Payment details not found for order ID {}: {}", orderId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching payment details for order ID {}: {}", orderId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/order/{orderId}")
    public ResponseEntity<String> deletePayment(@PathVariable Long orderId) {
        log.info("Deleting payment for order ID: {}", orderId);
        try {
            paymentService.deletePaymentByOrderId(orderId);
            log.info("Payment record deleted for order ID: {}", orderId);
            return ResponseEntity.ok("OrderId :" + orderId + " deleted successfully.");
        } catch (ResourceNotFoundException e) {
            log.warn("Attempted to delete non-existent payment for order ID {}: {}", orderId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error deleting payment for order ID {}: {}", orderId, e.getMessage(), e);
            throw e;
        }
    }
}
