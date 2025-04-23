import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold mt-4">Página no encontrada</h2>
        <p className="text-gray-600 mt-2">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
