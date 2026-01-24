import { useForm } from "react-hook-form";

export function LoginForm({ onSubmit, defaultValues }) {

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "all",
    defaultValues,
  });

  async function handleValid(values) {
    try {
      await onSubmit(values);
      reset();
    } catch (err) {
      // Surface server-side errors at the form level.
      const message = err?.message || "Login failed";
      setError("root", { type: "server", message });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleValid)}>
      <div className="grid gap-1">
        <label className="text-sm">
          Email
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            autoComplete="email"
            placeholder="user@example.org"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        {errors.email ? (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-1">
        <label className="text-sm">
          Password
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            autoComplete="current-password"
            placeholder="********"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        {errors.password ? (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="mt-6 w-full rounded-md border px-3 py-2 text-sm text-ink hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      {errors.root ? (
        <p className="mt-3 text-sm text-red-600">{errors.root.message}</p>
      ) : null}
    </form>
  );
}
