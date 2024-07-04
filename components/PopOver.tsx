import { useState } from "react";

interface Props {
  btnTxt: string;
  title: string;
  line1?: string;
  line2?: string;
  line3?: string;
  line4?: string;
  line5?: string;
  line6?: string;
  line7?: string;
}

const PopOver = ({
  btnTxt,
  title,
  line1,
  line2,
  line3,
  line4,
  line5,
  line6,
  line7,
}: Props) => {
  const [show, setShow] = useState(false);
  const lines = [line1, line2, line3, line4, line5, line6, line7];
  return (
    <>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => {
            setShow(true);
          }}
          className="btn-hint "
        >
          {btnTxt}
        </button>
      </div>
      {show && (
        <div className="buttons">
          <button
            onClick={() => {
              setShow(false);
            }}
            className="btn-cancel "
          >
            x
          </button>
          <p className="text-2xl">{title}</p>
          {lines.map((line, index) => (
            <p key={index} className="text-sm mb-5">
              {line && line}
            </p>
          ))}
        </div>
      )}
    </>
  );
};

export default PopOver;
