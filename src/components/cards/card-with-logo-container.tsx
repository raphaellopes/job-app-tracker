import Card from "@/components/cards/card";
import Logo from "@/components/logo";

interface CardWithLogoContainerProps {
  children: React.ReactNode;
}

const CardWithLogoContainer: React.FC<CardWithLogoContainerProps> = ({ children }) => (
  <main className="p-4 sm:p-10 flex flex-col items-center justify-center min-h-screen">
    <Card className="max-w-lg w-full p-10 shadow-md">
      <div className="flex flex-col items-center justify-center mb-6">
        <Logo size="lg" />
      </div>
      {children}
    </Card>
  </main>
);

export default CardWithLogoContainer;
