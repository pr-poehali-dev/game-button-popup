import RandomMessageGame from "@/components/RandomMessageGame";

const Index = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 
                    flex items-center justify-center p-8"
    >
      <div className="w-full max-w-4xl">
        <RandomMessageGame />
      </div>
    </div>
  );
};

export default Index;
