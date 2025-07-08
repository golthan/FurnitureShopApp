package com.furnitureapp.furnitureapi.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Converter(autoApply = true)
public class LocalDateAttributeConverter implements AttributeConverter<LocalDate, String> {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE; // YYYY-MM-DD
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"); // YYYY-MM-DD
                                                                                                                    // HH:MM:SS

    @Override
    public String convertToDatabaseColumn(LocalDate locDate) {
        return (locDate == null ? null : locDate.format(DATE_FORMATTER));
    }

    @Override
    public LocalDate convertToEntityAttribute(String sqlDate) {
        if (sqlDate == null) {
            return null;
        }
        try {
            // Try parsing as YYYY-MM-DD first
            return LocalDate.parse(sqlDate, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            // If that fails, try parsing as YYYY-MM-DD HH:MM:SS and extract date part
            try {
                return LocalDateTime.parse(sqlDate, DATETIME_FORMATTER).toLocalDate();
            } catch (DateTimeParseException e2) {
                // If both fail, re-throw the original exception or a new one
                throw new IllegalArgumentException("Failed to parse date string: " + sqlDate, e2);
            }
        }
    }
}
