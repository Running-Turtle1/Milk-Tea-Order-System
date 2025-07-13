package com.cxy.milktea.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final Integer status;
    private final String message;

    public BusinessException(Integer status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }
} 