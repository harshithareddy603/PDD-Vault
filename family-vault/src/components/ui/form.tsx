import * as React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View style={[styles.item, style]}>{children}</View>
    </FormItemContext.Provider>
  );
};

const FormLabel = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => {
  const { error } = useFormField();

  return (
    <Label style={[style, error && styles.errorText]}>
      {children}
    </Label>
  );
};

const FormControl = ({ children }: { children: React.ReactNode }) => {
  return <View>{children}</View>;
};

const FormDescription = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => {
  return <Text style={[styles.description, style]}>{children}</Text>;
};

const FormMessage = ({ children, style }: { children: React.ReactNode; style?: TextStyle }) => {
  const { error } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) return null;

  return <Text style={[styles.message, style]}>{body}</Text>;
};

const styles = StyleSheet.create({
  item: {
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  message: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ef4444",
    marginTop: 4,
  },
  errorText: {
    color: "#ef4444",
  },
});

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
