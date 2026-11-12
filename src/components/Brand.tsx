import Image from "next/image";

export function Brand() {
  return (
    <span className="brand">
      <Image
        src="/images/avatar-pet-clima.png"
        alt=""
        width={38}
        height={38}
        style={{ width: "auto" }}
      />
      <span>
        <strong>
          PET Folha
        </strong>
        <small>PET-Saúde Clima · UFG</small>
      </span>
    </span>
  );
}
