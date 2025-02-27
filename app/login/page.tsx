import { Descope } from "@descope/nextjs-sdk";

const Page = () => {
  return (
    <Descope
      flowId="sign-up-or-in"
      onSuccess={(e: any) => {
        // run the OIDC process and pass in the user's email (this is from the e.detail event object above)
        // redirect to the home page, finally clear the DS and DSR cookies that were set from this onSuccess
        console.log("Logged in!");
      }}
      onError={(e: any) => console.log("Could not logged in!")}
      redirectAfterSuccess="/"
      // redirectAfterError="/error-page"
    />
  );
};
