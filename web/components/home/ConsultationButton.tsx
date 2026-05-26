"use client";

import { Button, type ButtonProps } from "@/components/ui";
import { useConsultationModal } from "@/components/consultation/ConsultationModalProvider";

/**
 * Thin client island: a Button that opens the global consultation modal
 * (story-services-04). Lets the otherwise-static homepage hero (story-homepage-05 #3)
 * and final CTA (#8) trigger the modal without making whole sections client components.
 */
export function ConsultationButton({ children, ...rest }: ButtonProps) {
  const { open } = useConsultationModal();
  return (
    <Button onClick={open} {...rest}>
      {children}
    </Button>
  );
}
