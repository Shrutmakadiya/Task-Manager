import { Tab, Transition } from "@headlessui/react";
import { Fragment } from "react";
import clsx from "clsx";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Tabs({ tabs, setSelected, children, variant = "default" }) {
  const getTabVariantStyles = (selected, variant) => {
    const variants = {
      default: {
        base: "relative px-6 py-3 text-sm font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        selected: "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transform scale-105",
        unselected: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200"
      },
      pills: {
        base: "relative px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        selected: "text-blue-700 bg-blue-100 border border-blue-200 shadow-sm",
        unselected: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      },
      underline: {
        base: "relative px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 focus:outline-none",
        selected: "text-blue-600 border-blue-600",
        unselected: "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
      },
      modern: {
        base: "relative px-5 py-3 text-sm mr-2 font-semibold transition-all duration-300 rounded-xl focus:outline-none group overflow-hidden",
        selected: "text-blue-700 bg-white shadow-md border border-blue-100 transform -translate-y-0.5",
        unselected: "text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-sm"
      }
    };

    return variants[variant] || variants.default;
  };

  const getContainerStyles = (variant) => {
    const styles = {
      default: "inline-flex bg-gray-100 rounded-xl p-1 shadow-inner",
      pills: "inline-flex space-x-2",
      underline: "flex border-b border-gray-200 bg-white",
      modern: "inline-flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-2 shadow-lg backdrop-blur-sm"
    };

    return styles[variant] || styles.default;
  };

  return (
    <div className='w-full'>
      <Tab.Group>
        <div className="relative overflow-x-auto scrollbar-hide">
          <Tab.List className={clsx(
            "flex w-max min-w-full",
            getContainerStyles(variant)
          )}>
            {tabs.map((tab, index) => {
              const styles = getTabVariantStyles(false, variant);

              return (
                <Tab
                  key={tab.title}
                  onClick={() => setSelected?.(index)}
                  className={({ selected }) => {
                    const variantStyles = getTabVariantStyles(selected, variant);

                    return classNames(
                      variantStyles.base,
                      selected ? variantStyles.selected : variantStyles.unselected,
                      "group relative flex items-center gap-2.5 whitespace-nowrap"
                    );
                  }}
                >
                  {({ selected }) => (
                    <>
                      {/* Background animation for modern variant */}
                      {variant === "modern" && selected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
                      )}

                      {/* Icon with animation */}
                      <span className={clsx(
                        "relative z-10 transition-all duration-200",
                        selected
                          ? "text-current transform scale-110"
                          : "text-current group-hover:scale-105"
                      )}>
                        {tab.icon}
                      </span>

                      {/* Tab title */}
                      <span className="relative z-10 font-medium">
                        {tab.title}
                      </span>

                      {/* Badge/counter if provided */}
                      {tab.count !== undefined && (
                        <span className={clsx(
                          "relative z-10 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full transition-colors",
                          selected
                            ? "bg-white/20 text-current"
                            : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                        )}>
                          {tab.count}
                        </span>
                      )}

                      {/* Active indicator for underline variant */}
                      {variant === "underline" && selected && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current rounded-full" />
                      )}

                      {/* Ripple effect */}
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 transform scale-0 bg-current opacity-10 rounded-lg transition-transform duration-200 group-active:scale-100" />
                      </div>
                    </>
                  )}
                </Tab>
              );
            })}

            {/* Sliding indicator for modern variant */}
            {variant === "modern" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* This would need custom logic to animate between tabs */}
              </div>
            )}
          </Tab.List>
        </div>

        {/* Enhanced content area with animations */}
        <div className="relative mt-6">
          <Tab.Panels className="focus:outline-none">
            {Array.isArray(children) ? children.map((child, index) => (
              <Tab.Panel key={index} className="focus:outline-none">
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                  show={true}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {child}
                  </div>
                </Transition>
              </Tab.Panel>
            )) : (
              <Tab.Panel className="focus:outline-none">
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                  show={true}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {children}
                  </div>
                </Transition>
              </Tab.Panel>
            )}
          </Tab.Panels>
        </div>
      </Tab.Group>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Export additional variants for different use cases
export const TabsVariants = {
  DEFAULT: "default",
  PILLS: "pills",
  UNDERLINE: "underline",
  MODERN: "modern"
};

// Example usage with different variants:
// <Tabs tabs={tabs} variant="modern" setSelected={setSelected}>
// <Tabs tabs={tabs} variant="pills" setSelected={setSelected}>
// <Tabs tabs={tabs} variant="underline" setSelected={setSelected}>