const Footer = () => {
  return (
    <footer className="lh-title mv5 pv5 pl3 pr3 ph5-ns bt b--black-10">
      <h3 className="f6 tracked">
        Nat? Nat. Nat! is the blog of{" "}
        <a className="link blue dim" href="https://natwelch.com">
          Nat Welch
        </a>
        .
      </h3>

      <div className="mv2 rc-scout" data-scout-rendered="true">
        <p className="rc-scout__text">
          <i className="rc-scout__logo" /> Want to become a better programmer?{" "}
          <a
            className="rc-scout__link"
            href="https://www.recurse.com/scout/click?t=1a20cf01214e4c5923ab6ebd6c0f8f18"
          >
            Join the Recurse Center!
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
