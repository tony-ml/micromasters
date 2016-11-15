"""
General micromasters utility functions
"""
import json
import logging

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.serializers import serialize
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


log = logging.getLogger(__name__)


def webpack_dev_server_host(request):
    """
    Get the correct webpack dev server host
    """
    return settings.WEBPACK_DEV_SERVER_HOST or request.get_host().split(":")[0]


def webpack_dev_server_url(request):
    """
    Get the full URL where the webpack dev server should be running
    """
    return 'http://{}:{}'.format(webpack_dev_server_host(request), settings.WEBPACK_DEV_SERVER_PORT)


def dict_without_key(dictionary, key):
    """
    Helper method to remove a key from a dict and return the dict.
    This can be used in cases like a list comprehension
    where the actual dictionary is needed once the key is deleted ('del' does not return anything)
    """
    del dictionary[key]
    return dictionary


def load_json_from_file(project_rel_filepath):
    """
    Loads JSON data from a file
    """
    path = '{}/{}'.format(settings.BASE_DIR, project_rel_filepath)
    with open(path, 'r') as f:
        return json.load(f)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for rest api views
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    log.exception("An exception was intercepted by custom_exception_handler")
    response = exception_handler(exc, context)

    # if it is handled, just return the response
    if response is not None:
        return response

    # Otherwise format the exception only in specific cases
    if isinstance(exc, ImproperlyConfigured):
        formatted_exception_string = "{0}: {1}".format(type(exc).__name__, str(exc))
        return Response(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            data=[formatted_exception_string]
        )


def serialize_model_object(obj):
    """
    Serialize model into a dict representable as JSON

    Args:
        obj (django.db.models.Model): An instantiated Django model
    Returns:
        dict:
            A representation of the model
    """
    # serialize works on iterables so we need to wrap object in a list, then unwrap it
    data = json.loads(serialize('json', [obj]))[0]
    serialized = data['fields']
    serialized['id'] = data['pk']
    return serialized


def get_field_names(model):
    """
    Get field names which aren't autogenerated

    Args:
        model (class extending django.db.models.Model): A Django model class
    Returns:
        list of str:
            A list of field names
    """
    return [
        field.name for field in model._meta.get_fields() if not field.auto_created  # pylint: disable=protected-access
    ]


def first_matching_item(iterable, predicate):
    """
    Gets the first item in an iterable that matches a predicate (or None if nothing matches)

    Returns:
        Matching item or None
    """
    return next(filter(predicate, iterable), None)


def is_subset_dict(dict_to_test, master_dict):
    """
    Checks if a dictionary is a subset of another dictionary

    Args:
        dict_to_test (dict): The subset dictionary
        master_dict (dict): The dictionary to test against
    Returns:
        bool: Whether or not the first dictionary is a subset of the second
    """
    result = True
    try:
        for pkey, pvalue in dict_to_test.items():
            if isinstance(pvalue, dict):
                result = is_subset_dict(pvalue, master_dict[pkey])
                if not result:
                    return False
            else:
                if master_dict[pkey] != pvalue:
                    return False
    except KeyError:
        return False
    return result
