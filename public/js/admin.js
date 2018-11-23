const deleteProduct = (btn) => {
    
    // Get the previous-sibling csrf token and productid
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article');

    // Do a delete request to delete this product.
    // Note that the csrf token goes in a header, because
    // delete requests cannot have a request body.
    // https://github.com/expressjs/csurf
    fetch('/admin/product/' + productId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    }).then(result => {
        return result.json();
    })
    .then(result => {
        console.log(result);
        productElement.remove();

        // For older IE support use:
        // productElement.parentNode.removeChild(productElement)
    })
    .catch(err => {
        console.log(err);
    })

}