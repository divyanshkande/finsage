package com.example.finsage;

import org.springframework.stereotype.Component;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.RescaleOp;
import java.io.File;
import java.io.IOException;

@Component
public class ImagePreprocessor {

    public String preprocess(String inputPath) throws IOException {
        BufferedImage original = ImageIO.read(new File(inputPath));
        if (original == null) throw new IllegalArgumentException("Cannot read: " + inputPath);

        // 1. Grayscale
        BufferedImage gray = new BufferedImage(
            original.getWidth(), original.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.drawImage(original, 0, 0, null);
        g.dispose();

        // 2. Super aggressive contrast + brightness (receipts love this)
        RescaleOp contrastOp = new RescaleOp(2.5f, -100f, null);
        BufferedImage enhanced = contrastOp.filter(gray, null);

        // 3. Upscale 3× — Tesseract accuracy skyrockets at 300dpi
        int w = enhanced.getWidth() * 3;
        int h = enhanced.getHeight() * 3;
        BufferedImage upscaled = new BufferedImage(w, h, enhanced.getType());
        Graphics2D g2 = upscaled.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2.drawImage(enhanced, 0, 0, w, h, null);
        g2.dispose();

        // 4. Save
        String outputPath = inputPath.replaceAll("(?i)\\.[a-z]+$", "_processed.png");
        ImageIO.write(upscaled, "png", new File(outputPath));

        return outputPath;
    }
}