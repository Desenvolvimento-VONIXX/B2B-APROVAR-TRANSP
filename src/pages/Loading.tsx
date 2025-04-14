import Logo from "../assets/logo";
import DefaultLayout from "../layout/defaultLayout";

function Loading() {
  return (
    <DefaultLayout>
      <section className="bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen">
          <Logo className="w-full h-[50vh] fill-black dark:fill-white" />
          <h1 className="mb-4 text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-2xl lg:text-4xl dark:text-white">
            Carregando...
          </h1>
        </div>
      </section>
    </DefaultLayout>
  );
}

export default Loading;
