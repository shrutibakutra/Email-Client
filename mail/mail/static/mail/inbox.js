

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector("#compose-form");
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      fetch('/emails', {
        
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
        })
      })
        .then(response => response.json())
        .then(result => {
          // Print result
          load_mailbox('sent')
          console.log(result);
        });
    }) 

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function load_mailbox(mailbox) {
   
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch(`/emails/${ mailbox }`, {      
    method: 'GET',
  })
    .then(response => response.json())
    .then(emails => {
      // Print result
      emails.forEach((item)=>{
        let element = document.createElement('div');
        element.className = `card my-1 items`;
        element.innerHTML = `<div class="card-body" id="item-${item.id}" >
        ${item.sender}   | ${item.subject} | ${item.timestamp}
        <br>
        ${item.body.slice(0, 100)}
    </div>`
      document.querySelector("#emails-view").appendChild(element);
      element.addEventListener("click", () => {
        show_mail(item.id, mailbox);
      });
      })
    });

}

function show_mail(id , mailbox){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then((email)=>{
    document.querySelector("#emails-view").innerHTML = "";
    let item = document.createElement("div");
    item.className = `card`;
      item.innerHTML = `<div class="card-body" style="white-space: pre-wrap;">
      Sender: ${email.sender}
      Recipients: ${email.recipients}
      Subject: ${email.subject}
      Time: ${email.timestamp}
      <br>${email.body}
      
      <div>`
      document.querySelector("#emails-view").appendChild(item);
      let archive = document.createElement("btn");
      archive.className = `btn btn-outline-info my-2`;
      archive.textContent = "Archive";
      archive.addEventListener("click", () => {
        console.log(email.id,email.archive)
        update_archive(email.id,email.archived);
      });
      document.querySelector("#emails-view").appendChild(archive);
      if (mailbox=='sent'){
        return;
      }
      let Reply = document.createElement("btn");
      Reply.className = `btn btn-outline-success m-2`;
      Reply.textContent = "Reply";
      Reply.addEventListener("click",()=>{
        reply_to_mail(email.sender, email.subject, email.body, email.timestamp)
      })
      document.querySelector("#emails-view").appendChild(Reply);

    })}

function update_archive(id,state){
  console.log(id)
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !state
    })
  })
  
}

function reply_to_mail(sender , subject ,body , timestamp){
  compose_email();
  if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  pre_fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;

  document.querySelector("#compose-body").value = pre_fill;

}