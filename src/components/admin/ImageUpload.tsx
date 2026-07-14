import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adminUploadImage } from "@/lib/admin.functions";

interface ImageUploadProps {
  value?: string | null;
  onChange?: (url: string | undefined) => void;
  aspect?: "video" | "square" | "wide";
  label?: string;
  hint?: string;
}

const aspectClass: Record<string, string> = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ value, onChange, aspect = "video", label = "الصورة", hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = value || undefined;

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      const { url } = await adminUploadImage({ data: { filename: file.name, dataUrl } });
      onChange?.(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div
        className={`relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 ${aspectClass[aspect]}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                onChange?.(undefined);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute end-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow hover:bg-background"
              aria-label="إزالة الصورة"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground transition hover:bg-muted/50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">جارٍ الرفع...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm">اضغط لرفع صورة من جهازك</span>
                <span className="text-xs opacity-70">PNG · JPG · WEBP</span>
              </>
            )}
          </button>
        )}
        {uploading && preview && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="ms-2 h-4 w-4" />
          استبدال الصورة
        </Button>
      )}
    </div>
  );
}
