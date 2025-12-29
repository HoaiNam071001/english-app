export const DisplayText = ({ text }: { text: string }) => {
  return (
    <div>
      {text.split("\n").map((str, index) => (
        <span key={index}>
          {str}
          <br />
        </span>
      ))}
    </div>
  );
};
