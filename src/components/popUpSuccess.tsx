import React from "react";
interface ModalConfirmacaoProps {
  isOpen: boolean;
  onClose: () => void;
}

const PopUp: React.FC<ModalConfirmacaoProps> = ({ isOpen, onClose }) => {
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className={`flex flex-col overflow-y-auto overflow-x-hidden bg-black/50 fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-[calc(100%)] max-h-full`}
          onClick={handleOutsideClick}
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                onClick={onClose}
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                X
              </button>

              <div className="p-4 text-center">
                <h3 className="text-4xl mb-2 font-semibold text-gray-500 dark:text-gray-100">
                  🎉 Sucesso!
                </h3>
                <h3 className="text-xl mb-2 font-medium text-gray-500 dark:text-gray-200">
                  Sua nova senha já está ativa.
                </h3>
                <h3 className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-300">
                  Que tal testar agora mesmo?
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Vamos lá! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PopUp;
