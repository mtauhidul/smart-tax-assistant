import {
  ArrowRight,
  CheckCircle,
  FileText,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HeaderImg from "../assets/home.png";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function HomePage() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="w-full bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Asistente Fiscal</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Inicio
            </Link>
            <a
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Características
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Cómo funciona
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={handleLogin}
            >
              Iniciar sesión
            </Button>
            <Button size="sm" onClick={handleRegister}>
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Simplifica tu declaración de impuestos
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Con asistencia inteligente para completar tu Modelo 100 sin
                complicaciones. Responde preguntas simples y obtén tu
                declaración lista para presentar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleRegister}
                >
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <a href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Ver cómo funciona
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md h-80 md:h-96 bg-white rounded-xl shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <img
                    src={HeaderImg}
                    alt="Dashboard preview"
                    className="max-w-[80%] max-h-[80%] object-contain rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Todo lo que necesitas para tu declaración
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nuestro asistente inteligente te guía a través de todo el
                proceso de forma sencilla.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Asistente Conversacional</CardTitle>
                  <CardDescription>
                    Responde preguntas simples en una conversación natural.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Sin terminología fiscal compleja</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Asistencia personalizada</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Generación Automática</CardTitle>
                  <CardDescription>
                    Formularios rellenados automáticamente con tu información.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Modelo 100 completo</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>PDF listo para presentar</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Seguridad y Privacidad</CardTitle>
                  <CardDescription>
                    Tus datos fiscales están seguros con encriptación avanzada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Datos encriptados</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Cumplimiento GDPR</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Cómo funciona</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Completar tu declaración de la renta nunca ha sido tan fácil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Crea tu cuenta</h3>
                <p className="text-muted-foreground">
                  Regístrate con tu correo electrónico o cuenta de Google.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Responde preguntas
                </h3>
                <p className="text-muted-foreground">
                  Nuestro asistente te hará preguntas simples sobre tu
                  situación.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Obtén tu declaración
                </h3>
                <p className="text-muted-foreground">
                  Revisa y descarga tu Modelo 100 listo para presentar.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" onClick={handleRegister}>
                Comenzar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Simplifica tu declaración de la renta hoy mismo
            </h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto opacity-90">
              Una forma sencilla y rápida de completar tu declaración de
              impuestos.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-primary font-medium"
              onClick={handleRegister}
            >
              Comenzar gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Shield className="h-6 w-6" />
                <span className="text-xl font-bold">Asistente Fiscal</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Simplificamos el proceso de declaración de impuestos para que
                puedas completar tu Modelo 100 sin complicaciones.
              </p>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Inicio
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Características
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    Cómo funciona
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-inherit"
                  >
                    Términos y condiciones
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-inherit"
                  >
                    Política de privacidad
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/cookies")}
                    className="hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-inherit"
                  >
                    Política de cookies
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Asistente Fiscal. Todos los derechos
              reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">
                Diseñado y desarrollado con ❤️ en España
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
