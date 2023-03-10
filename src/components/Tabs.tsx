import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

const Root = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function TabsRoot({ ...props }, ref) {
  return <TabsPrimitive.Root ref={ref} className={""} {...props} />;
});
Root.displayName = TabsPrimitive.Root.displayName;

const List = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList(props, ref) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const childrens = React.Children.map(props.children, (child) => {
    if (!React.isValidElement(child) || child.type !== Trigger) {
      throw new Error(
        `Tabs.List component only accepts as children the Tabs.Trigger component`,
      );
    }
    return child;
  });

  React.useEffect(() => {
    const updateSelectPosition = () => {
      if (!containerRef.current) return;
      if (!selectRef.current) return;
      if (!buttonRefs.current.length) return;

      const selectedRef = buttonRefs.current.find(
        (button) => button?.ariaSelected === "true",
      );
      if (!selectedRef) return;

      const selectedBoundingBox = selectedRef.getBoundingClientRect();
      const containerBoundingBox = containerRef.current.getBoundingClientRect();

      selectRef.current.style.transitionDuration = "250ms";
      selectRef.current.style.opacity = "1";
      selectRef.current.style.width = `${selectedBoundingBox.width}px`;
      selectRef.current.style.transform = `translate(${
        selectedBoundingBox.left - containerBoundingBox.left
      }px)`;
    };

    updateSelectPosition();
  }, [props.children]);

  return (
    <TabsPrimitive.List
      ref={containerRef}
      // ref={ref} @TODO outside ref?
      className="relative inline-flex items-center justify-center rounded-md bg-gray-100 p-1"
      {...props}
    >
      <div
        ref={selectRef}
        className="absolute left-0 inline-flex h-8 min-w-[78px] items-center justify-center rounded-[0.185rem] bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition-all disabled:pointer-events-none lg:min-w-[90px]"
      />
      {childrens?.map((child, index) => {
        return React.cloneElement(child, {
          ref: (i: HTMLButtonElement) => (buttonRefs.current[index] = i),
          ...child.props,
        });
      })}
    </TabsPrimitive.List>
  );
});
List.displayName = TabsPrimitive.List.displayName;

const Trigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger(props, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className="relative inline-flex min-w-[78px] items-center justify-center rounded-[0.185rem] px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors duration-150 focus-visible:outline-orange-500 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-gray-900 lg:min-w-[90px]"
      {...props}
    />
  );
});
Trigger.displayName = TabsPrimitive.Trigger.displayName;

const Content = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent(props, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      // rounded-md border border-gray-200
      className="mt-2 p-4"
      {...props}
    />
  );
});
Content.displayName = TabsPrimitive.Content.displayName;

export const Tabs = Object.assign(Root, { List, Trigger, Content });

// @TODO Hover state
// @TODO Improve typescript
// @TODO remove callback type on React.cloneElement

// data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
