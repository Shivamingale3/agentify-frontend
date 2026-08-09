"use client";

import { useMemo, type ComponentType } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { RiArrowDownSLine, RiCheckLine, RiEarthLine } from "@remixicon/react";
import { getCountryCallingCode, type Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { cn } from "@/lib/utils";

/** `react-phone-number-input`'s "International" option carries a `undefined`
 *  country value, which Base UI's Combobox can't use as an item value — so
 *  it's represented internally as the sentinel country code `"ZZ"`. */
const INTERNATIONAL = "ZZ";
type CountryValue = Country | typeof INTERNATIONAL;

interface CountryOption {
  value?: Country;
  label: string;
  divider?: boolean;
}

interface CountryItem {
  value: CountryValue;
  label: string;
}

interface CountrySelectProps {
  value?: Country;
  options: CountryOption[];
  onChange: (country?: Country) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  "aria-label"?: string;
}

/**
 * `react-phone-number-input`'s own `EmbeddedFlagProps` type only declares
 * `title`, but the underlying `country-flag-icons` SVG components accept the
 * usual SVG props — widen the type so `className` can be passed through.
 */
type FlagComponent = ComponentType<{ title?: string; className?: string }>;

function CountryFlag({ country }: { country: CountryValue }) {
  const Flag =
    country === INTERNATIONAL
      ? undefined
      : (flags[country] as FlagComponent | undefined);
  return (
    <span className="flex size-4 shrink-0 items-center justify-center overflow-hidden">
      {Flag ? (
        <Flag title="" className="size-full object-cover" />
      ) : (
        <RiEarthLine className="size-3.5 text-muted-foreground" />
      )}
    </span>
  );
}

/**
 * Custom `countrySelectComponent` for `react-phone-number-input`, built on
 * Base UI's `Combobox` instead of the library's default native `<select>` —
 * the native select's open-state listbox is OS-themed and can't be made to
 * follow the app's light/dark palette. Flags are bundled SVGs (`react-phone-number-input/flags`)
 * rather than the library's default remote-image flags, so there's no network
 * dependency and nothing to fail to load.
 */
export function CountrySelect({
  value,
  options,
  onChange,
  onFocus,
  onBlur,
  disabled,
  name,
  "aria-label": ariaLabel,
}: CountrySelectProps) {
  const items = useMemo<CountryItem[]>(
    () =>
      options
        .filter(
          (option): option is CountryOption & { divider?: false } =>
            !option.divider,
        )
        .map((option) => ({
          value: option.value ?? INTERNATIONAL,
          label: option.label,
        })),
    [options],
  );

  const selected = useMemo(
    () => items.find((item) => item.value === (value ?? INTERNATIONAL)) ?? null,
    [items, value],
  );

  return (
    <Combobox.Root
      items={items}
      value={selected}
      onValueChange={(item) =>
        onChange(item && item.value !== INTERNATIONAL ? item.value : undefined)
      }
      itemToStringLabel={(item: CountryItem) => item.label}
      isItemEqualToValue={(item: CountryItem, other: CountryItem) =>
        item.value === other.value
      }
      disabled={disabled}
    >
      <Combobox.Trigger
        name={name}
        aria-label={ariaLabel}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex shrink-0 items-center gap-1 text-foreground outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        <CountryFlag country={selected?.value ?? INTERNATIONAL} />
        <RiArrowDownSLine className="size-3.5 text-muted-foreground" />
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner
          align="start"
          sideOffset={8}
          className="outline-none"
        >
          <Combobox.Popup className="w-72 max-w-[var(--available-width)] origin-[var(--transform-origin)] border border-border bg-popover text-foreground transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0">
            <Combobox.Input
              placeholder="Search countries…"
              className="h-10 w-full border-0 border-b border-border bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Combobox.Empty className="px-3 py-4 text-sm text-muted-foreground">
              No countries found.
            </Combobox.Empty>
            <Combobox.List className="max-h-72 overflow-y-auto overscroll-contain py-1">
              {(item: CountryItem) => (
                <Combobox.Item
                  key={item.value}
                  value={item}
                  className={cn(
                    "flex cursor-default items-center gap-2 px-3 py-2 text-sm outline-none select-none",
                    "data-highlighted:bg-secondary",
                  )}
                >
                  <CountryFlag country={item.value} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.value !== INTERNATIONAL && (
                    <span className="text-muted-foreground">
                      +{getCountryCallingCode(item.value)}
                    </span>
                  )}
                  <Combobox.ItemIndicator className="text-foreground">
                    <RiCheckLine className="size-3.5" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
