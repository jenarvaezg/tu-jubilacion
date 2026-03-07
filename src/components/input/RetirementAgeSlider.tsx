import { Slider } from "../shared/Slider.tsx";

interface RetirementAgeSliderProps {
  readonly value: number;
  readonly onChange: (age: number) => void;
}

export function RetirementAgeSlider({
  value,
  onChange,
}: RetirementAgeSliderProps) {
  return (
    <Slider
      id="retirement-age-slider"
      label="Edad de jubilación deseada"
      value={value}
      min={63}
      max={70}
      step={1}
      onChange={onChange}
      formatValue={(v) => `${v} años`}
    />
  );
}
