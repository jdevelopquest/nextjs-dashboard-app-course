import clsx from "clsx";

export default function FlashForm({
  isError,
  message,
}: {
  isError: boolean;
  message: string;
}) {
  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6">
      <p
        aria-live="polite"
        className={clsx(
          "flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium",
          isError ? "text-red-600" : "text-gray-600",
        )}
      >
        {message}
      </p>
    </div>
  );
}
