//
//
//package com.example.payment.service;
//
//import com.example.payment.dto.PaymentRequestDTO;
//import com.example.payment.dto.PaymentResponseDTO;
//import com.example.payment.exception.DuplicateTransactionException;
//import com.example.payment.exception.ResourceNotFoundException;
//
///**
// * Defines the contract for payment-related business operations.
// * This service layer acts as an abstraction over data access and business logic
// * for managing payment transactions within the application.
// */
//public interface PaymentService {
//
//    /**
//     * Initiates a new payment transaction.
//     *
//     * @param requestDTO The data transfer object containing details required to initiate a payment.
//     * @return A {@link PaymentResponseDTO} representing the newly initiated payment's status and details.
//     * @throws DuplicateTransactionException if a payment for the given order ID has already been initiated.
//     */
//    PaymentResponseDTO initiatePayment(PaymentRequestDTO requestDTO);
//
//    /**
//     * Confirms a previously initiated payment.
//     *
//     * @param requestDTO The data transfer object containing details to confirm the payment.
//     * @throws DuplicateTransactionException if the transaction has already been confirmed.
//     * @throws ResourceNotFoundException if the payment transaction to confirm is not found.
//     */
//    void confirmPayment(PaymentRequestDTO requestDTO) throws DuplicateTransactionException, ResourceNotFoundException;
//
//    /**
//     * Retrieves the details of a payment based on its associated order ID.
//     *
//     * @param orderId The unique identifier of the order for which to retrieve payment details.
//     * @return A {@link PaymentResponseDTO} containing the payment details.
//     * @throws ResourceNotFoundException if no payment is found for the given order ID.
//     */
//    PaymentResponseDTO getPaymentDetails(Long orderId) throws ResourceNotFoundException;
//
//    /**
//     * Deletes a payment record identified by its associated order ID.
//     *
//     * @param orderId The unique identifier of the order whose payment record should be deleted.
//     * @throws ResourceNotFoundException if no payment is found for the given order ID to delete.
//     */
//    void deletePaymentByOrderId(Long orderId) throws ResourceNotFoundException;
//}
package com.example.payment.service;

import com.example.payment.dto.PaymentRequestDTO;
import com.example.payment.dto.PaymentResponseDTO;
import com.example.payment.exception.DuplicateTransactionException;
import com.example.payment.exception.ResourceNotFoundException;
import com.example.payment.exception.InvalidInputFormatException;

public interface PaymentService {

    PaymentResponseDTO initiatePayment(PaymentRequestDTO requestDTO) throws InvalidInputFormatException;

    void confirmPayment(PaymentRequestDTO requestDTO) throws DuplicateTransactionException, ResourceNotFoundException, InvalidInputFormatException;

    PaymentResponseDTO getPaymentDetails(Long orderId) throws ResourceNotFoundException;

    void deletePaymentByOrderId(Long orderId) throws ResourceNotFoundException;
}

