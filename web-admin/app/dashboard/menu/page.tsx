/**
 * Página: Menú
 * Gestión del menú del restaurante
 * Permite crear, editar y organizar categorías y productos
 */

import Link from 'next/link';
import { Plus, Edit, Trash2, MoreVertical, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Página de gestión del menú
 */
export default function MenuPage() {
  // Datos de ejemplo (en producción vendrían de la API)
  const categories: any[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión del Menú</h2>
          <p className="text-slate-400 mt-1">
            Organiza tus categorías y productos
          </p>
        </div>
        <Link href="/dashboard/menu/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva categoría
          </Button>
        </Link>
      </div>

      {/* Contenido */}
      {categories.length === 0 ? (
        // Estado vacío
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No tienes categorías
          </h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Crea tu primera categoría y empieza a agregar productos a tu menú
          </p>
          <Link href="/dashboard/menu/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear categoría
            </Button>
          </Link>
        </div>
      ) : (
        // Lista de categorías
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Header de categoría */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button className="text-slate-500 hover:text-slate-400 cursor-grab">
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-white">
                    {category.name}
                  </h3>
                  <span className="text-slate-500 text-sm">
                    ({category.products?.length || 0} productos)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Productos */}
              <div className="divide-y divide-slate-800">
                {category.products?.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-600 hover:text-slate-500 cursor-grab">
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-slate-400 text-sm">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-400 font-medium">
                        ${product.price}
                      </span>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agregar producto */}
              <div className="p-4 bg-slate-950/50">
                <Button variant="ghost" className="text-slate-400 hover:text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar producto
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
