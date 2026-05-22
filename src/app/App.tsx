import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { router } from "./routes";

export default function App() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === "F5") {
        event.preventDefault();
        console.log("Limpando localStorage e recarregando...");
        localStorage.clear();
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <RouterProvider router={router} />;
}