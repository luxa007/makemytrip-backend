package com.makemytrip.service.impl;

import com.makemytrip.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@Slf4j
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    private final Path uploadPath;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new FileStorageException("Could not create upload directory: " + uploadDir);
        }
    }

    public String storeFile(MultipartFile file) {
        validateFile(file);
        String originalName = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : ".jpg";
        String fileName = UUID.randomUUID() + extension;
        try {
            Path target = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored review photo: {}", fileName);
            return "/uploads/reviews/" + fileName;
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file: " + originalName);
        }
    }

    public List<String> storeFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(storeFile(file));
        }
        return urls;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new FileStorageException("File is empty");
        if (file.getSize() > MAX_SIZE_BYTES) throw new FileStorageException("File exceeds 5MB limit");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new FileStorageException("Only JPEG, PNG, WEBP images are allowed");
    }
}
