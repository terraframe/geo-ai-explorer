package net.geoprism.geoai.explorer.web.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import net.geoprism.geoai.explorer.core.model.GenericRestException;

@ControllerAdvice
public class ExceptionHandlerAdvice
{

  @ExceptionHandler(GenericRestException.class)
  public ResponseEntity<?> handleException(GenericRestException e)
  {
    // log exception
    return ResponseEntity.status(e.getStatus()).body(e.getMessage());
  }
}
