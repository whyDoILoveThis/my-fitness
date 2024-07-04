import React from "react";

interface Props {
  type: string;
  placeholder: string;
  btnTxt: string;
  btnTxtSize: string;
  stateVar?: boolean;
  setStateVar?: Function;
  setValue?: Function;
  value?: string;
  value2?: boolean;
  funct?: Function;
  funct2?: Function;
}

const ItsInput = ({
  type,
  placeholder,
  btnTxt,
  btnTxtSize,
  stateVar,
  setStateVar,
  setValue,
  value,
  value2,
  funct,
  funct2,
}: Props) => {
  return (
    <>
      {stateVar && (
        <div className="flex items-center justify-between border rounded-full">
          <input
            className="ml-4 outline-0 bg-transparent"
            placeholder={placeholder}
            type={type}
            onChange={(e) => {
              setValue && setValue(e.target.value);
            }}
          />
          <button
            onClick={() => {
              setStateVar && setStateVar(false);
              funct && funct();
              funct2 && funct2(!value2);
            }}
            className={` font-extrabold text-${btnTxtSize}xl px-2 translate-y-[-2px]`}
          >
            {btnTxt}
          </button>
        </div>
      )}
    </>
  );
};

export default ItsInput;
