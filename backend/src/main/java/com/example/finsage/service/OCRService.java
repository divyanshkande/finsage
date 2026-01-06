package com.example.finsage.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import java.io.File;

@Service
public class OCRService {

    private final Tesseract tesseract;

    public OCRService() {
        tesseract = new Tesseract();

        String path = System.getProperty("tesseract.datapath");
        if (path == null || path.isEmpty()) {
            throw new IllegalStateException(
                "\nTESSDATA_PATH not found!\n" +
                "Add this to your .env file:\n" +
                "TESSDATA_PATH=C:/Users/Divyansh/AppData/Local/Programs/Tesseract-OCR/tessdata"
            );
        }

        tesseract.setDatapath(path);
        tesseract.setLanguage("eng");
        tesseract.setPageSegMode(6);           // perfect for receipts
        tesseract.setOcrEngineMode(1);         // LSTM = best accuracy
        tesseract.setTessVariable("preserve_interword_spaces", "1");

        System.out.println("Tesseract ready! Using tessdata: " + path);
    }

    public String extractText(String imagePath) {
        try {
            String text = tesseract.doOCR(new File(imagePath));
            System.out.println("\nOCR RESULT:\n" + text + "\n");
            return text.isBlank() ? " " : text;
        } catch (TesseractException e) {
            throw new RuntimeException("OCR failed: " + e.getMessage(), e);
        }
    }
}