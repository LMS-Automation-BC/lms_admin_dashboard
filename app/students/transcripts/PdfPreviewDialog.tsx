"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import html2canvas from "html2canvas";
import {
  Document,
  Page as PDFPage,
  PDFViewer,
  Image,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

type Props = {
  open: boolean;
  studentName?: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  onBeforeGenerate?: () => void | Promise<void>;
  onAfterGenerate?: () => void;
  onClose: () => void;
};

export default function PdfPreviewDialog({
  open,
  studentName,
  contentRef,
  onBeforeGenerate,
  onAfterGenerate,
  onClose,
}: Props) {
  const [capturedImageSrc, setCapturedImageSrc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const captureDomAsImage = async (element: HTMLElement) => {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    return canvas.toDataURL("image/png");
  };

  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      padding: 12,
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
    emptyStateWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyStateText: {
      fontSize: 12,
    },
  });

  const transcriptDocument = (
    <Document title={`${studentName || "Transcript"}-Transcript`}>
      <PDFPage size="A4" style={styles.page}>
        {capturedImageSrc ? (
          <Image src={capturedImageSrc} style={styles.image} />
        ) : (
          <View style={styles.emptyStateWrap}>
            <Text style={styles.emptyStateText}>PDF preview is not available.</Text>
          </View>
        )}
      </PDFPage>
    </Document>
  );

  useEffect(() => {
    const buildPreview = async () => {
      if (!open || !contentRef.current) return;

      try {
        setIsGenerating(true);
        await onBeforeGenerate?.();
        await new Promise((resolve) => setTimeout(resolve, 0));

        const imageDataUri = await captureDomAsImage(contentRef.current);
        setCapturedImageSrc(imageDataUri);
      } finally {
        setIsGenerating(false);
        onAfterGenerate?.();
      }
    };

    buildPreview();
  }, [open, contentRef, onBeforeGenerate, onAfterGenerate]);

  const handlePrintPdf = async () => {
    if (!capturedImageSrc) return;

    const blob = await pdf(transcriptDocument).toBlob();
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      URL.revokeObjectURL(blobUrl);
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${studentName || "Transcript"}-Transcript</title>
          <style>
            html, body { margin: 0; height: 100%; }
            iframe { border: 0; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <iframe src="${blobUrl}"></iframe>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      URL.revokeObjectURL(blobUrl);
    }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        PDF Preview
        <div>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePrintPdf}
            disabled={!capturedImageSrc || isGenerating}
            sx={{ mr: 1 }}
          >
            {isGenerating ? "Preparing..." : "Print PDF"}
          </Button>
          <Button variant="text" size="small" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ height: "80vh" }}>
        {capturedImageSrc ? (
          <PDFViewer width="100%" height="100%">
            {transcriptDocument}
          </PDFViewer>
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
            {isGenerating ? "Generating PDF preview..." : "Unable to render PDF preview."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}