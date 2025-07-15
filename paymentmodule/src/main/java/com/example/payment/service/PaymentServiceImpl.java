//
//
//
//
//package com.example.payment.service;
//
//import com.example.payment.dto.PaymentRequestDTO;
//import com.example.payment.dto.PaymentResponseDTO;
//import com.example.payment.exception.DuplicateTransactionException;
//import com.example.payment.exception.ResourceNotFoundException;
//import com.example.payment.model.Payment;
//import com.example.payment.model.PaymentStatus;
//import com.example.payment.repository.PaymentRepository;
//import lombok.extern.slf4j.Slf4j; // Provides the 'log' object for logging
//import org.modelmapper.ModelMapper;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//
///**
// * Service implementation for managing payment-related business logic.
// * Handles operations such as initiating, confirming, retrieving, and deleting payments.
// */
//@Service
//@Slf4j // Enables logging for this service class
//public class PaymentServiceImpl implements PaymentService {
//
//    private final PaymentRepository paymentRepository;
//    private final ModelMapper modelMapper;
//
//    /**
//     * Constructs the PaymentServiceImpl, injecting PaymentRepository and ModelMapper.
//     */
//    public PaymentServiceImpl(PaymentRepository paymentRepository, ModelMapper modelMapper) {
//        this.paymentRepository = paymentRepository;
//        this.modelMapper = modelMapper;
//        log.info("PaymentServiceImpl initialized."); // Logs service startup
//    }
//
//    /**
//     * Initiates a new payment based on the provided request.
//     * Throws DuplicateTransactionException if a payment for the order ID already exists.
//     *
//     * @param requestDTO Details for the payment to be initiated.
//     * @return PaymentResponseDTO containing details of the initiated payment.
//     */
//    @Override
//    public PaymentResponseDTO initiatePayment(PaymentRequestDTO requestDTO) {
//        log.info("Initiating payment for order ID: {}", requestDTO.getOrderId()); // Log initiation attempt
//        Optional<Payment> existingPayment = paymentRepository.findByOrderId(requestDTO.getOrderId());
//
//        if (existingPayment.isPresent()) {
//            // Logs a warning if a duplicate payment initiation is detected.
//            log.warn("Payment already initiated for Order ID: {}. Throwing DuplicateTransactionException.", requestDTO.getOrderId());
//            throw new DuplicateTransactionException("Payment already initiated for Order ID: " + requestDTO.getOrderId());
//        }
//
//        Payment payment = new Payment();
//        payment.setOrderId(requestDTO.getOrderId());
//        payment.setPaymentMethod(requestDTO.getPaymentMethod());
//        payment.setPaymentAmount(requestDTO.getPaymentAmount());
//        payment.setPaymentStatus(PaymentStatus.Pending); // Default status for new payments
//        payment.setCreatedBy(requestDTO.getCreatedBy());
//        payment.setCreatedOn(LocalDateTime.now());
//
//        Payment savedPayment = paymentRepository.save(payment);
//        // Logs successful payment initiation, including the generated ID.
//        log.info("Payment initiated and saved with ID: {} for Order ID: {}", savedPayment.getOrderId(), savedPayment.getOrderId());
//        return modelMapper.map(savedPayment, PaymentResponseDTO.class);
//    }
//
//    /**
//     * Confirms an existing payment.
//     * Updates the payment status to Success.
//     *
//     * @param requestDTO Details to identify and confirm the payment.
//     * @throws DuplicateTransactionException if the transaction is already confirmed.
//     * @throws ResourceNotFoundException if the payment for the given order ID is not found.
//     */
//    @Override
//    public void confirmPayment(PaymentRequestDTO requestDTO) throws DuplicateTransactionException, ResourceNotFoundException {
//        log.info("Attempting to confirm payment for order ID: {}", requestDTO.getOrderId()); // Log confirmation attempt
//
//        Payment payment = paymentRepository.findByOrderId(requestDTO.getOrderId())
//                .orElseThrow(() -> {
//                    // Logs if the payment to be confirmed is not found.
//                    log.warn("Payment not found for order ID {} during confirmation.", requestDTO.getOrderId());
//                    return new ResourceNotFoundException("Order ID not found: " + requestDTO.getOrderId());
//                });
//
//        if (PaymentStatus.Success.equals(payment.getPaymentStatus())) {
//            // Logs if the payment is already in a success state.
//            log.warn("Transaction for order ID {} is already confirmed (Success status). Throwing DuplicateTransactionException.", requestDTO.getOrderId());
//            throw new DuplicateTransactionException("Transaction already confirmed.");
//        }
//
//        payment.setPaymentStatus(PaymentStatus.Success); // Set payment status to success
//        payment.setUpdatedBy(requestDTO.getCreatedBy()); // Assuming 'createdBy' is used for 'updatedBy' on confirmation
//        payment.setUpdatedOn(LocalDateTime.now());
//
//        paymentRepository.save(payment);
//        log.info("Payment confirmed successfully for order ID: {}", requestDTO.getOrderId()); // Log successful confirmation
//    }
//
//    /**
//     * Retrieves payment details by order ID.
//     *
//     * @param orderId The unique identifier of the order.
//     * @return PaymentResponseDTO containing the details of the found payment.
//     * @throws ResourceNotFoundException if no payment is found for the given order ID.
//     */
//    @Override
//    public PaymentResponseDTO getPaymentDetails(Long orderId) throws ResourceNotFoundException {
//        log.info("Fetching payment details for order ID: {}", orderId); // Log retrieval attempt
//
//        Payment payment = paymentRepository.findByOrderId(orderId)
//                .orElseThrow(() -> {
//                    // Logs if payment details are not found.
//                    log.warn("Payment not found for order ID {}.", orderId);
//                    return new ResourceNotFoundException("Payment not found for order ID: " + orderId);
//                });
//
//        log.info("Payment details found for order ID: {}. Transaction ID: {}", orderId, payment.getOrderId()); // Log successful retrieval
//        return modelMapper.map(payment, PaymentResponseDTO.class);
//    }
//
//    /**
//     * Deletes a payment record by its order ID.
//     *
//     * @param orderId The ID of the order whose payment record is to be deleted.
//     * @throws ResourceNotFoundException if no payment is found for the given order ID.
//     */
//    @Override
//    public void deletePaymentByOrderId(Long orderId) throws ResourceNotFoundException {
//        log.info("Attempting to delete payment for order ID: {}", orderId); // Log deletion attempt
//
//        Payment payment = paymentRepository.findByOrderId(orderId)
//                .orElseThrow(() -> {
//                    // Logs if the payment to be deleted is not found.
//                    log.warn("Payment not found for deletion for order ID {}.", orderId);
//                    return new ResourceNotFoundException("Payment not found for order ID: " + orderId);
//                });
//
//        paymentRepository.delete(payment);
//        log.info("Payment record successfully deleted for order ID: {}", orderId); // Log successful deletion
//    }
//}
package com.example.payment.service;

import com.example.payment.dto.PaymentRequestDTO;
import com.example.payment.dto.PaymentResponseDTO;
import com.example.payment.exception.DuplicateTransactionException;
import com.example.payment.exception.ResourceNotFoundException;
import com.example.payment.exception.InvalidInputFormatException;
import com.example.payment.model.Payment;
import com.example.payment.model.PaymentStatus;
import com.example.payment.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ModelMapper modelMapper;

    public PaymentServiceImpl(PaymentRepository paymentRepository, ModelMapper modelMapper) {
        this.paymentRepository = paymentRepository;
        this.modelMapper = modelMapper;
        log.info("PaymentServiceImpl initialized.");
    }

    @Override
    public PaymentResponseDTO initiatePayment(PaymentRequestDTO requestDTO) throws InvalidInputFormatException {
        log.info("Initiating payment for order ID: {}", requestDTO.getOrderId());
        Optional<Payment> existingPayment = paymentRepository.findByOrderId(requestDTO.getOrderId());

        if (existingPayment.isPresent()) {
            log.warn("Payment already initiated for Order ID: {}. Throwing DuplicateTransactionException.", requestDTO.getOrderId());
            throw new DuplicateTransactionException("Payment already initiated for Order ID: " + requestDTO.getOrderId());
        }

        Payment payment = new Payment();
        payment.setOrderId(requestDTO.getOrderId());
        payment.setPaymentMethod(requestDTO.getPaymentMethod());
        payment.setPaymentAmount(requestDTO.getPaymentAmount());
        payment.setPaymentStatus(PaymentStatus.Pending);
        payment.setCreatedBy(requestDTO.getCreatedBy());
        payment.setCreatedOn(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment initiated and saved with ID: {} for Order ID: {}", savedPayment.getOrderId(), savedPayment.getOrderId());
        return modelMapper.map(savedPayment, PaymentResponseDTO.class);
    }

    @Override
    public void confirmPayment(PaymentRequestDTO requestDTO) throws DuplicateTransactionException, ResourceNotFoundException, InvalidInputFormatException {
        log.info("Attempting to confirm payment for order ID: {}", requestDTO.getOrderId());

        Payment payment = paymentRepository.findByOrderId(requestDTO.getOrderId())
                .orElseThrow(() -> {
                    log.warn("Payment not found for order ID {} during confirmation.", requestDTO.getOrderId());
                    return new ResourceNotFoundException("Order ID not found: " + requestDTO.getOrderId());
                });

        if (PaymentStatus.Success.equals(payment.getPaymentStatus())) {
            log.warn("Transaction for order ID {} is already confirmed (Success status). Throwing DuplicateTransactionException.", requestDTO.getOrderId());
            throw new DuplicateTransactionException("Transaction already confirmed.");
        }

        payment.setPaymentStatus(PaymentStatus.Success);
        payment.setUpdatedBy(requestDTO.getCreatedBy());
        payment.setUpdatedOn(LocalDateTime.now());

        paymentRepository.save(payment);
        log.info("Payment confirmed successfully for order ID: {}", requestDTO.getOrderId());
    }

    @Override
    public PaymentResponseDTO getPaymentDetails(Long orderId) throws ResourceNotFoundException {
        log.info("Fetching payment details for order ID: {}", orderId);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> {
                    log.warn("Payment not found for order ID {}.", orderId);
                    return new ResourceNotFoundException("Payment not found for order ID: " + orderId);
                });

        log.info("Payment details found for order ID: {}. Transaction ID: {}", orderId, payment.getOrderId());
        return modelMapper.map(payment, PaymentResponseDTO.class);
    }

    @Override
    public void deletePaymentByOrderId(Long orderId) throws ResourceNotFoundException {
        log.info("Attempting to delete payment for order ID: {}", orderId);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> {
                    log.warn("Payment not found for deletion for order ID {}.", orderId);
                    return new ResourceNotFoundException("Payment not found for order ID: " + orderId);
                });

        paymentRepository.delete(payment);
        log.info("Payment record successfully deleted for order ID: {}", orderId);
    }
}