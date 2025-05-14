"use client";

import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Keyword } from "@/lib/types";

interface WordCloudProps {
  keywords: Keyword[];
}

export default function WordCloud({ keywords }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || keywords.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate font sizes based on keyword values
    const maxValue = Math.max(...keywords.map((k) => k.value));
    const minFontSize = 14;
    const maxFontSize = 36;

    // Sort keywords by value (largest first)
    const sortedKeywords = [...keywords].sort((a, b) => b.value - a.value);

    // Calculate the maximum radius for the circle
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4; // 40% of the smaller dimension
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Keep track of placed words for collision detection
    const placedWords: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    // Draw a subtle circle boundary
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    sortedKeywords.forEach((keyword, index) => {
      const fontSize =
        minFontSize + (keyword.value / maxValue) * (maxFontSize - minFontSize);
      ctx.font = `${fontSize}px Inter, sans-serif`;

      // Calculate text metrics
      const metrics = ctx.measureText(keyword.text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      // Try to place the word
      let attempts = 0;
      let placed = false;
      const maxAttempts = 50;

      while (!placed && attempts < maxAttempts) {
        // Calculate position using a more circular distribution
        const angle = (attempts * 0.5) % (Math.PI * 2); // Slower angle progression
        const radius = maxRadius * (attempts / maxAttempts) * 0.8; // Scale radius based on attempts

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Check if text fits within the circular boundary with padding
        const padding = 10;
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );

        if (
          distanceFromCenter + textWidth / 2 + padding <= maxRadius &&
          x - textWidth / 2 - padding >= 0 &&
          x + textWidth / 2 + padding <= canvas.width &&
          y - textHeight / 2 - padding >= 0 &&
          y + textHeight / 2 + padding <= canvas.height
        ) {
          // Check for collisions with other words
          const hasCollision = placedWords.some(
            (word) =>
              Math.abs(x - word.x) < (textWidth + word.width) / 2 + padding &&
              Math.abs(y - word.y) < (textHeight + word.height) / 2 + padding
          );

          if (!hasCollision) {
            // Draw text with gradient
            const gradient = ctx.createLinearGradient(
              x - textWidth / 2,
              y - textHeight / 2,
              x + textWidth / 2,
              y + textHeight / 2
            );
            gradient.addColorStop(0, "rgba(99, 102, 241, 0.9)");
            gradient.addColorStop(1, "rgba(79, 70, 229, 0.9)");

            ctx.fillStyle = gradient;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(keyword.text, x, y);

            // Add to placed words
            placedWords.push({
              x,
              y,
              width: textWidth,
              height: textHeight,
            });

            placed = true;
          }
        }

        attempts++;
      }
    });
  }, [keywords]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Key Topics</CardTitle>
        <CardDescription>
          Visualization of the most frequently mentioned topics in your standup.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <div className="w-full aspect-[2/1] rounded-lg border-2 border-dashed border-muted-foreground/20 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
}
