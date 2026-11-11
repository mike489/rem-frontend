"use client";
// Runs a form Server Action and tracks its result (errors, success) and pending state.
//
// Why not just <form action={...}>: React resets a form after its action runs, which would
// wipe everything the user typed whenever validation fails. Submitting manually avoids that;
// pass resetOnSuccess to clear the form only after a successful save.
import { startTransition, useActionState, useRef, type FormEvent } from "react";
import type { FormAction, FormState } from "@/lib/forms";

export function useFormAction(action: FormAction, { resetOnSuccess = false } = {}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, dispatch, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (resetOnSuccess && result.success) formRef.current?.reset();
    return result;
  }, {});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, errors: state.errors ?? {}, pending, onSubmit, formRef };
}
