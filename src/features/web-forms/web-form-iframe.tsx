import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
  getWebFormIframeByUuid,
  submitWebFormIframeByUuid,
} from '@/services/web-form-service';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { Loader2Icon } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { WebForm, Field } from './data/schema';

export function WebFormIframe() {
  const { uuid } = useParams({ from: '/(public)/web-form/iframe/$uuid' });
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error' | 'rate_limit'
  >('idle');

  const { data: webForm, isLoading } = useQuery<WebForm>({
    queryKey: ['webFormIframe', uuid],
    queryFn: () => getWebFormIframeByUuid(uuid),
  });

  const submitMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      submitWebFormIframeByUuid(uuid, data),
    onSuccess: () => {
      setSubmitStatus('success');
      setFormData({});
      setErrors({});

      if (webForm?.redirect_url) {
        setTimeout(() => {
          window.parent.location.href = webForm.redirect_url!;
        }, 2000);
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          setSubmitStatus('rate_limit');
        } else {
          setSubmitStatus('error');
        }
      } else {
        setSubmitStatus('error');
      }
    },
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const hadDarkClass = root.classList.contains('dark');
    const originalHtmlBg = root.style.backgroundColor;
    const originalBodyBg = body.style.backgroundColor;

    root.classList.remove('dark');
    root.classList.add('light');

    root.style.backgroundColor = 'transparent';
    body.style.backgroundColor = 'transparent';

    return () => {
      root.style.backgroundColor = originalHtmlBg;
      body.style.backgroundColor = originalBodyBg;
      if (hadDarkClass) {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    if (webForm) {
      const root = document.documentElement;
      const styles = webForm.styles;

      if (styles.containerBgEnabled) {
        root.style.setProperty('--container-bg', styles.containerBg);
      }
      root.style.setProperty('--input-bg', styles.inputBg);
      root.style.setProperty('--input-text-color', styles.inputTextColor);
      root.style.setProperty('--input-border-color', styles.inputBorderColor);
      root.style.setProperty('--label-color', styles.labelColor);
      root.style.setProperty('--button-bg-color', styles.buttonBgColor);
      root.style.setProperty('--label-font-size', `${styles.labelFontSize}px`);
    }
  }, [webForm]);

  const validateField = (field: Field, value: unknown): string | null => {
    if (
      field.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      return webForm?.styles.alertMessages.required || 'Bu alan zorunludur.';
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) {
        return (
          webForm?.styles.alertMessages.invalidInput ||
          'Geçersiz e-posta adresi.'
        );
      }
    }

    if (field.type === 'phone' && value) {
      const phoneStr = value as string;
      try {
        const phoneUtil = PhoneNumberUtil.getInstance();
        const phoneNumber = phoneUtil.parse(phoneStr);
        if (!phoneUtil.isValidNumber(phoneNumber)) {
          return (
            webForm?.styles.alertMessages.invalidInput ||
            'Geçersiz telefon numarası.'
          );
        }
      } catch {
        return (
          webForm?.styles.alertMessages.invalidInput ||
          'Geçersiz telefon numarası.'
        );
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!webForm) return;

    // Validate all fields
    const newErrors: Record<string, string> = {};
    webForm.fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare submission data
    const submissionData: Record<string, unknown> = {
      category_id: webForm.category_id,
    };

    webForm.fields.forEach((field) => {
      if (field.systemField) {
        submissionData[field.systemField] = formData[field.id];
      } else {
        submissionData[field.label] = formData[field.id];
      }
    });

    submitMutation.mutate(submissionData);
  };

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }

    // Reset submit status when user starts typing again
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  };

  const renderField = (field: Field) => {
    const fieldValue = formData[field.id];
    const hasError = !!errors[field.id];

    const commonProps = {
      id: field.id,
      required: field.required,
      className: hasError ? 'border-red-500' : '',
      style: {
        backgroundColor: webForm?.styles.inputBg,
        color: webForm?.styles.inputTextColor,
        borderColor: hasError ? '#ef4444' : webForm?.styles.inputBorderColor,
      },
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'datetime-local':
      case 'time':
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={(fieldValue as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case 'phone':
        return (
          <PhoneInput
            defaultCountry={field.defaultCountry?.toLowerCase() || 'tr'}
            value={(fieldValue as string) || ''}
            onChange={(phone) => handleFieldChange(field.id, phone)}
            style={{
              width: '100%',
            }}
            inputStyle={{
              width: '100%',
              height: '40px',
              fontSize: '14px',
              backgroundColor: webForm?.styles.inputBg,
              color: webForm?.styles.inputTextColor,
              borderColor: hasError
                ? '#ef4444'
                : webForm?.styles.inputBorderColor,
            }}
            countrySelectorStyleProps={{
              buttonStyle: {
                height: '40px',
                backgroundColor: webForm?.styles.inputBg,
                borderColor: hasError
                  ? '#ef4444'
                  : webForm?.styles.inputBorderColor,
                borderRight: 'none',
              },
            }}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={(fieldValue as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            value={(fieldValue as string) || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger {...commonProps} className="w-full">
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={(fieldValue as string) || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label
                  htmlFor={`${field.id}-${option}`}
                  style={{ color: webForm?.styles.labelColor }}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const checked = Array.isArray(fieldValue)
                ? fieldValue.includes(option)
                : false;
              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const currentValues = (fieldValue as string[]) || [];
                      const newValues = isChecked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option);
                      handleFieldChange(field.id, newValues);
                    }}
                  />
                  <Label
                    htmlFor={`${field.id}-${option}`}
                    style={{ color: webForm?.styles.labelColor }}
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!webForm) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Form Bulunamadı</h2>
          <p className="text-muted-foreground mt-2">
            Aradığınız form mevcut değil veya kaldırılmış olabilir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundColor: webForm.styles.containerBgEnabled
          ? webForm.styles.containerBg
          : 'transparent',
      }}
    >
      <div
        className="mx-auto max-w-3xl"
        style={{
          border: webForm.styles.iframeBorderEnabled
            ? `1px solid ${webForm.styles.iframeBorderColor}`
            : 'none',
          borderRadius: webForm.styles.iframeBorderEnabled ? '8px' : '0',
          padding: webForm.styles.iframeBorderEnabled ? '24px' : '0',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitStatus === 'success' && (
            <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {webForm.styles.alertMessages.success}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {webForm.styles.alertMessages.failure}
            </div>
          )}

          {submitStatus === 'rate_limit' && (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              {webForm.styles.alertMessages.rateLimit}
            </div>
          )}

          <div className="grid grid-cols-12 gap-4">
            {webForm.fields.map((field) => (
              <div
                key={field.id}
                className={`col-span-12 ${
                  field.width === '50%' ? 'md:col-span-6' : ''
                }`}
              >
                <Label
                  htmlFor={field.id}
                  style={{
                    color: webForm.styles.labelColor,
                    fontSize: `${webForm.styles.labelFontSize}px`,
                  }}
                  className="mb-2 block"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </Label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              style={{
                backgroundColor: webForm.styles.buttonBgColor,
                color: '#ffffff',
              }}
              className="w-full"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                webForm.styles.buttonLabel
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
