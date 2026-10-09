"use client";

import React, { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Phone, MapPin, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  property_type: string;
  listing_status: string;
  price: number;
  thumbnail_url?: string;
  location?: string;
  district?: string;
  neighborhood?: string;
  sub_category?: string;
}

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
}

export default function StoryCardModal({ isOpen, onClose, listing }: StoryCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!listing) return null;

  const propertyTypeName = listing.property_type === "konut" ? "KONUT" :
                           listing.property_type === "ticari" ? "İŞ YERİ" :
                           listing.property_type === "arsa" ? "ARSA" : "OTOMOTİV";

  const statusName = listing.listing_status === "satilik" ? "SATILIK" : "KİRALIK";
  const formattedPrice = new Intl.NumberFormat("tr-TR").format(listing.price) + " ₺";
  const coverImage = listing.thumbnail_url || "/images/ce.png";
  const locationText = listing.location || listing.district || "Tokat";

  // Function to render HD 1080x1920 canvas and trigger image download
  const handleDownloadStoryImage = () => {
    setIsGenerating(true);

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // 1. Dark Gradient Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGradient.addColorStop(0, "#0F172A"); // Slate 900
    bgGradient.addColorStop(0.5, "#1E293B");
    bgGradient.addColorStop(1, "#020617");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Gold Top Banner Accent
    const topAccent = ctx.createLinearGradient(0, 0, 1080, 0);
    topAccent.addColorStop(0, "#FFB000");
    topAccent.addColorStop(0.5, "#F59E0B");
    topAccent.addColorStop(1, "#D97706");
    ctx.fillStyle = topAccent;
    ctx.fillRect(0, 0, 1080, 24);

    // Load main cover photo
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = coverImage;

    img.onload = () => {
      // 3. Header Text & Logo Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 46px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CEYHUN GAYRİMENKUL & OTOMOTİV", 540, 120);

      ctx.fillStyle = "#FFB000";
      ctx.font = "600 32px sans-serif";
      ctx.fillText("TOKAT PORTFÖY VİTRİNİ", 540, 170);

      // 4. Draw Image Container Box (Rounded effect simulated)
      const imgX = 80;
      const imgY = 220;
      const imgW = 920;
      const imgH = 920;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 36);
      ctx.clip();

      // Cover image aspect fit/fill
      const imgAspect = img.width / img.height;
      const boxAspect = imgW / imgH;
      let drawW = imgW;
      let drawH = imgH;
      let drawX = imgX;
      let drawY = imgY;

      if (imgAspect > boxAspect) {
        drawW = imgH * imgAspect;
        drawX = imgX - (drawW - imgW) / 2;
      } else {
        drawH = imgW / imgAspect;
        drawY = imgY - (drawH - imgH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Image border
      ctx.strokeStyle = "#FFB000";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 36);
      ctx.stroke();

      // 5. Category & Status Pill
      const pillY = 1200;
      ctx.fillStyle = "#FFB000";
      ctx.beginPath();
      ctx.roundRect(80, pillY, 340, 70, 20);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${statusName} ${propertyTypeName}`, 250, pillY + 48);

      // Location Tag Pill
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(440, pillY, 560, 70, 20);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "600 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`📍 ${locationText}`, 720, pillY + 48);

      // 6. Title Box
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 52px sans-serif";
      ctx.textAlign = "left";

      // Wrap title text if long
      const words = listing.title.split(" ");
      let line = "";
      let titleY = 1350;
      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        let metrics = ctx.measureText(testLine);
        if (metrics.width > 920 && i > 0) {
          ctx.fillText(line, 80, titleY);
          line = words[i] + " ";
          titleY += 65;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 80, titleY);

      // 7. Price Banner Box
      const priceY = Math.max(titleY + 40, 1490);
      const priceGradient = ctx.createLinearGradient(80, priceY, 1000, priceY);
      priceGradient.addColorStop(0, "#FFB000");
      priceGradient.addColorStop(1, "#F59E0B");

      ctx.fillStyle = priceGradient;
      ctx.beginPath();
      ctx.roundRect(80, priceY, 920, 130, 28);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "extrabold 72px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(formattedPrice, 540, priceY + 90);

      // 8. Contact Footer Banner
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.roundRect(80, priceY + 160, 920, 110, 24);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 38px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📞 Detaylı Bilgi & Randevu: 0532 385 04 20", 540, priceY + 230);

      // 9. Website URL Footer
      ctx.fillStyle = "#94A3B8";
      ctx.font = "500 30px sans-serif";
      ctx.fillText("www.ceyhundan.com", 540, 1880);

      // Convert to image download link
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `story-${listing.id}.png`;
      link.href = dataUrl;
      link.click();

      setIsGenerating(false);
    };

    img.onerror = () => {
      alert("Görsel yüklenirken bir hata oluştu.");
      setIsGenerating(false);
    };
  };

  const handleShareWhatsapp = () => {
    const text = `Merhaba! Ceyhun Gayrimenkul Portföyü: ${listing.title} - Fiyat: ${formattedPrice}. Detaylar: https://www.ceyhundan.com/ilan/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full bg-slate-950 text-white border border-slate-800 p-6 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-400">
            <Sparkles size={20} />
            <span>Instagram & WhatsApp Story Kartı</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Sosyal medyada paylaşmak için özel hazırlanmış 9:16 hikaye kartı önizlemesi.
          </DialogDescription>
        </DialogHeader>

        {/* 9:16 Live Story Preview Box */}
        <div className="relative w-full aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl p-4 flex flex-col justify-between my-2">
          {/* Top Brand Header */}
          <div className="text-center z-10 pt-2">
            <h3 className="font-extrabold text-sm sm:text-base tracking-wider text-white">
              CEYHUN GAYRİMENKUL & OTOMOTİV
            </h3>
            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
              TOKAT PORTFÖY VİTRİNİ
            </span>
          </div>

          {/* Photo Preview Box */}
          <div className="relative w-full h-[50%] rounded-xl overflow-hidden border border-amber-400/40 my-2 bg-slate-950 shadow-lg">
            <Image
              src={coverImage}
              alt={listing.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Listing Details Preview */}
          <div className="space-y-2 z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-1 rounded-md">
                {statusName} {propertyTypeName}
              </span>
              <span className="bg-white/10 text-white font-medium text-[11px] px-2.5 py-1 rounded-md border border-white/20 truncate">
                📍 {locationText}
              </span>
            </div>

            <h4 className="font-bold text-sm sm:text-base text-white leading-tight line-clamp-2">
              {listing.title}
            </h4>

            {/* Price Box */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-2.5 rounded-xl text-center shadow-lg">
              <span className="font-black text-lg sm:text-xl block leading-none">
                {formattedPrice}
              </span>
            </div>

            {/* Contact Footer */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 text-center border border-white/10 text-[11px] font-bold text-gray-200">
              📞 0532 385 04 20 • www.ceyhundan.com
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={handleDownloadStoryImage}
            disabled={isGenerating}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span>{isGenerating ? "Görsel Üretiliyor..." : "Story Görselini İndir (PNG)"}</span>
          </Button>

          <Button
            onClick={handleShareWhatsapp}
            variant="outline"
            className="w-full border-slate-700 hover:bg-slate-900 text-white font-bold flex items-center justify-center gap-2"
          >
            <Share2 size={18} className="text-emerald-400" />
            <span>WhatsApp'ta Paylaş</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
