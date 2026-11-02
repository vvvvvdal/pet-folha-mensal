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
          PET-Saúde <span className="text-info">Clima</span>
        </strong>
        <small>Folha de frequência mensal</small>
      </span>
    </span>
  );
}
