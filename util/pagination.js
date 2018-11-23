function getPageState(currentPage, recordsPerPage, totalRecords ) {

    const hasPreviousPage = currentPage > 1;
    const previousPage = currentPage - 1;
    const hasNextPage = totalRecords > (currentPage * recordsPerPage);
    const nextPage = currentPage + 1;
    const lastPage = Math.ceil(totalRecords / recordsPerPage);

    const pageState = {
        showPagination: totalRecords > recordsPerPage,
        hasPreviousPage: hasPreviousPage,
        currentPage: currentPage,
        previousPage: previousPage,
        hasNextPage: hasNextPage,
        nextPage: nextPage,
        lastPage: lastPage
    };

    return pageState;

}


module.exports = getPageState;