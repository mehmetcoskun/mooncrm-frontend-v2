import { useRef, useEffect } from 'react';
import EmailEditor, {
  type EditorRef,
  type EmailEditorProps,
} from 'react-email-editor';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type EmailEditorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: string | null;
  onSave: (template: string, html: string) => void;
  title?: string;
  description?: string;
};

export function EmailEditorSheet({
  open,
  onOpenChange,
  initialTemplate,
  onSave,
  title = 'E-Posta Şablonu Tasarla',
  description = 'E-posta şablonunuzu aşağıdaki editörde tasarlayın ve kaydedin.',
}: EmailEditorSheetProps) {
  const emailEditorRef = useRef<EditorRef>(null);

  useEffect(() => {
    if (open && initialTemplate && emailEditorRef.current) {
      // Load the template when editor is ready and dialog opens
      const loadTemplate = () => {
        try {
          const templateJson = JSON.parse(initialTemplate);
          emailEditorRef.current?.editor?.loadDesign(templateJson);
        } catch (_error) {
          // Template couldn't be parsed or loaded
        }
      };

      // Give the editor some time to initialize
      setTimeout(loadTemplate, 500);
    }
  }, [open, initialTemplate]);

  const onReady: EmailEditorProps['onReady'] = () => {
    // Editor is ready
    if (initialTemplate && emailEditorRef.current) {
      try {
        const templateJson = JSON.parse(initialTemplate);
        emailEditorRef.current.editor?.loadDesign(templateJson);
      } catch (_error) {
        // Template couldn't be parsed or loaded
      }
    }
  };

  const handleSave = () => {
    if (!emailEditorRef.current?.editor) return;

    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;
      const templateJson = JSON.stringify(design);
      onSave(templateJson, html);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-none p-0 sm:max-w-none"
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="h-[calc(100vh-180px)] w-full">
          <EmailEditor
            ref={emailEditorRef}
            onReady={onReady}
            minHeight="100%"
            options={{
              locale: 'tr-TR',
              appearance: {
                theme: 'modern_light',
              },
              features: {
                preview: true,
                imageEditor: true,
                undoRedo: true,
              },
            }}
          />
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
          >
            İptal
          </Button>
          <Button onClick={handleSave} size="sm">
            Kaydet
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
