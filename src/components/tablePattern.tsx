import React from "react";
import { GrSearch } from "react-icons/gr";

const Container: React.FC<{ children: React.ReactNode; title?: string }> = ({
  title,
  children,
}) => {
  return (
    <section className="bg-gray-100 dark:bg-gray-900 pb-12">
      <div className="mx-auto px-4 lg:px-12">
        {title && (
          <h1 className="mb-4 text-base font-bold leading-none tracking-tight text-gray-900 md:text-base lg:text-lg dark:text-white">
            {title}
          </h1>
        )}
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
          {children}
        </div>
      </div>
    </section>
  );
};

// Subcomponentes

const Headers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
      {children}
    </div>
  );
};

const Search: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ placeholder, value, onChange }) => {
  return (
    <div className="w-full md:w-1/2">
      <div className="flex items-center">
        <label htmlFor="simple-search" className="sr-only">
          {placeholder}
        </label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <GrSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            id="simple-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        {children}
      </table>
    </div>
  );
};

const Head: React.FC<{ headers: string[] }> = ({ headers }) => {
  return (
    <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-100">
      <tr>
        {headers.map((header, index) => (
          <th key={index} scope="col" className="px-4 py-3">
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tr className="border-b dark:border-gray-700">{children}</tr>;
};

const Index: React.FC<
  React.ThHTMLAttributes<HTMLTableCellElement> & { addClass?: string }
> = ({ children, addClass = "", ...props }) => {
  return (
    <th
      scope="row"
      className={`px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white ${addClass}`}
      {...props}
    >
      {children}
    </th>
  );
};

const Data: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement> & { addClass?: string }
> = ({ children, addClass = "", ...props }) => {
  return (
    <td className={`px-4 py-3 ${addClass}`} {...props}>
      {children}
    </td>
  );
};

const Tabela = {
  Container,
  Layout,
  Headers,
  Search,
  Head,
  Body,
  Row,
  Data,
  Index,
};

// Exporta o componente com subcomponentes
export default Tabela;
